"""Run only against a disposable test database: PASTOTALK_TEST_URL=http://127.0.0.1:5000 python3 tests/integration.py"""
from concurrent.futures import ThreadPoolExecutor
import datetime, json, os, time, unittest, urllib.request, urllib.error, uuid
BASE=os.getenv("PASTOTALK_TEST_URL","http://127.0.0.1:5000").rstrip("/")
TODAY=datetime.date.today().isoformat()
def http(method,path,data=None,token=None,headers=None):
    h={"Content-Type":"application/json",**(headers or {})}
    if token:h["Authorization"]="Bearer "+token
    req=urllib.request.Request(BASE+path,json.dumps(data).encode() if data is not None else None,h,method=method)
    client=urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:response=client.open(req,timeout=15)
    except urllib.error.HTTPError as e:response=e
    with response:
        body=response.read()
        return response.status,json.loads(body) if body else None,response.headers
PAYLOADS={
 "animals":{"name":"Vaca Teste","birthDate":"2020-01-01","entryDate":"2021-01-01","gender":"female","photoURL":""},
 "milk-productions":{"date":TODAY,"quantity":125.75},
 "milk-prices":{"date":TODAY,"price":2.5123},
 "incomes":{"date":TODAY,"description":"Venda de leite","value":350.25,"received":True},
 "expenses":{"date":TODAY,"description":"Ração","value":80.15,"paid":True,"installments":1},
}
class Integration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for _ in range(60):
            try:
                if http("GET","/health")[0]==200:return
            except (OSError,urllib.error.URLError):pass
            time.sleep(.5)
        raise RuntimeError("API unavailable")
    def account(self):
        username="test_"+uuid.uuid4().hex
        p={"name":"Pessoa Teste","email":username+"@example.com","username":username,"password":"test-password-123"}
        code,user,_=http("POST","/users",p);self.assertEqual(code,201,user)
        code,s,_=http("POST","/login",{"username":username,"password":p["password"]});self.assertEqual(code,200,s)
        return username,user["id"],s["token"],p
    def setUp(self):self.username,self.user_id,self.token,self.payload=self.account()
    def create_location(self,token=None):
        code,l,_=http("POST","/locations",{"name":"Fazenda Teste","address":"Zona Rural","dairyCattle":True},token or self.token)
        self.assertEqual(code,201,l);self.assertEqual(l["role"],"admin");return l["id"]
    def test_login_profile_validation(self):
        self.assertEqual(http("GET","/locations")[0],401)
        self.assertEqual(http("POST","/login",{"username":self.username,"password":"wrong"})[0],401)
        self.assertEqual(http("POST","/users",self.payload)[0],409)
        self.assertEqual(http("POST","/users",{**self.payload,"username":"new_"+uuid.uuid4().hex,"password":""})[0],400)
        code,u,_=http("GET","/me",token=self.token);self.assertEqual(code,200);self.assertNotIn("password",u)
        code,u,_=http("PUT","/me",{"name":"Novo Nome","email":self.payload["email"],"username":self.username},self.token)
        self.assertEqual(code,200,u);self.assertEqual(u["name"],"Novo Nome")
        self.assertEqual(http("POST","/login",{"username":self.username,"password":"test-password-123","role":"admin"})[0],400)
        self.assertEqual(http("GET","/users",token=self.token)[0],405)
    def test_isolation_archiving(self):
        l=self.create_location();_,_,other,_=self.account();path=f"/locations/{l}"
        for resource in PAYLOADS:
            self.assertEqual(http("GET",path+"/"+resource,token=other)[0],404)
            self.assertEqual(http("POST",path+"/"+resource,PAYLOADS[resource],other)[0],404)
        for method,data in [("GET",None),("DELETE",None),("PUT",{"name":"Hack","address":"X"})]:
            self.assertEqual(http(method,path,data,other)[0],404)
        self.assertEqual(http("GET",f"/dashboard?locationID={l}",token=other)[0],404)
        self.assertEqual(http("GET","/locations",token=other)[1],[])
        self.assertEqual(http("PUT",path,{"name":"Atualizada","address":"X","dairyCattle":False},self.token)[0],200)
        self.assertEqual(http("DELETE",path,token=self.token)[0],204)
        self.assertEqual(http("GET","/locations",token=self.token)[1],[])
        self.assertEqual(http("GET",path+"/members",token=self.token)[0],404)
    def test_resource_crud_and_cross_property(self):
        l=self.create_location();other=self.create_location()
        for resource,p in PAYLOADS.items():
            path=f"/locations/{l}/{resource}";code,r,_=http("POST",path,p,self.token);self.assertEqual(code,201,r)
            self.assertEqual(http("GET",path,token=self.token)[1][0]["id"],r["id"])
            self.assertEqual(http("GET",path+f'/{r["id"]}',token=self.token)[0],200)
            self.assertEqual(http("GET",f'/locations/{other}/{resource}/{r["id"]}',token=self.token)[0],404)
            self.assertEqual(http("PUT",f'/locations/{other}/{resource}/{r["id"]}',p,self.token)[0],404)
            self.assertEqual(http("DELETE",f'/locations/{other}/{resource}/{r["id"]}',token=self.token)[0],404)
            self.assertEqual(http("PUT",path+f'/{r["id"]}',p,self.token)[0],200)
            self.assertEqual(http("DELETE",path+f'/{r["id"]}',token=self.token)[0],204)
            self.assertEqual(http("GET",path,token=self.token)[1],[])
    def test_price_and_bad_payloads(self):
        a=self.create_location();b=self.create_location()
        p=PAYLOADS["milk-prices"]
        self.assertEqual(http("POST",f"/locations/{a}/milk-prices",p,self.token)[0],201)
        self.assertEqual(http("POST",f"/locations/{a}/milk-prices",p,self.token)[0],409)
        self.assertEqual(http("POST",f"/locations/{b}/milk-prices",p,self.token)[0],201)
        for payload in [{"date":TODAY,"quantity":-1},{"date":"0000-01-01","quantity":1},{"date":TODAY,"quantity":1,"locationID":b},{"date":TODAY,"quantity":1,"role":"admin"}]:
            self.assertEqual(http("POST",f"/locations/{a}/milk-productions",payload,self.token)[0],400)
        self.assertEqual(http("GET","/locations/no/animals",token=self.token)[0],400)
    def test_dashboard_monthly_totals(self):
        l=self.create_location()
        for resource in ["animals","milk-productions","incomes","expenses"]:
            self.assertEqual(http("POST",f"/locations/{l}/{resource}",PAYLOADS[resource],self.token)[0],201)
        self.assertEqual(http("POST",f"/locations/{l}/milk-productions",{"date":"2020-01-01","quantity":900},self.token)[0],201)
        data=http("GET",f"/dashboard?locationID={l}",token=self.token)[1]
        self.assertEqual(data["animals"],1);self.assertEqual(data["milk"],125.75)
        self.assertEqual(data["income"],350.25);self.assertEqual(data["expense"],80.15)
        self.assertEqual(data["received"],350.25);self.assertEqual(data["paid"],80.15)
        self.assertEqual(len(data["milkByDay"]),1)
    def test_cors_bearer(self):
        status,_,h=http("OPTIONS","/locations",headers={"Origin":"http://localhost:3000","Access-Control-Request-Method":"GET","Access-Control-Request-Headers":"authorization"})
        self.assertIn(status,[200,204]);self.assertEqual(h["Access-Control-Allow-Origin"],"http://localhost:3000")
        self.assertEqual(http("GET","/locations",headers={"Authorization":"Basic "+self.token})[0],401)
    def test_members_roles_revocation(self):
        l=self.create_location();path=f"/locations/{l}";team=path+"/members";username,user,token,_=self.account()
        self.assertEqual(http("GET",team,token=token)[0],404)
        self.assertEqual(http("POST",team,{"username":username,"role":"owner"},self.token)[0],400)
        self.assertEqual(http("POST",team,{"username":"missing_"+uuid.uuid4().hex,"role":"viewer"},self.token)[0],404)
        self.assertEqual(http("POST",team,{"username":" "+username.upper()+" ","role":"viewer"},self.token)[0],201)
        self.assertEqual(http("POST",team,{"username":username,"role":"editor"},self.token)[0],409)
        members=http("GET",team,token=token)[1];self.assertEqual(len(members),2)
        self.assertEqual(set(members[0]),{"id","name","username","role"})
        self.assertEqual(http("GET","/locations",token=token)[1][0]["role"],"viewer")
        for resource,p in PAYLOADS.items():
            endpoint=path+"/"+resource;code,r,_=http("POST",endpoint,p,self.token);self.assertEqual(code,201,r)
            self.assertEqual(http("GET",endpoint,token=token)[0],200)
            self.assertEqual(http("GET",endpoint+f'/{r["id"]}',token=token)[0],200)
            for method,url in [("POST",endpoint),("PUT",endpoint+f'/{r["id"]}'),("DELETE",endpoint+f'/{r["id"]}')]:
                self.assertEqual(http(method,url,p if method!="DELETE" else None,token)[0],403)
        for method,url,body in [("POST",team,{"username":self.username,"role":"admin"}),("PUT",team+"/"+user,{"role":"admin"}),("DELETE",team+"/"+user,None)]:
            self.assertEqual(http(method,url,body,token)[0],403)
        self.assertEqual(http("PUT",team+"/"+user,{"role":"editor"},self.token)[0],200)
        for resource,p in PAYLOADS.items():
            if resource=="milk-prices":p={**p,"date":"2020-01-01"}
            endpoint=path+"/"+resource;code,r,_=http("POST",endpoint,p,token);self.assertEqual(code,201,r)
            self.assertEqual(http("PUT",endpoint+f'/{r["id"]}',p,token)[0],200)
            self.assertEqual(http("DELETE",endpoint+f'/{r["id"]}',token=token)[0],204)
        self.assertEqual(http("PUT",path,{"name":"X","address":"Y"},token)[0],403)
        self.assertEqual(http("DELETE",path,token=token)[0],403)
        self.assertEqual(http("POST","/locations",{"name":"X","address":"Y","role":"admin"},token)[0],400)
        own=self.create_location(token);self.assertEqual(http("GET",f"/locations/{own}",token=self.token)[0],404)
        self.assertEqual(http("DELETE",team+"/"+user,token=self.token)[0],204)
        self.assertEqual(http("GET",team,token=token)[0],404)
        self.assertEqual(http("GET",path+"/milk-productions",token=token)[0],404)
        self.assertEqual(http("GET",f"/dashboard?locationID={l}",token=token)[0],404)
        self.assertNotIn(l,[p["id"] for p in http("GET","/locations",token=token)[1]])
    def test_last_admin_concurrent_demotion(self):
        l=self.create_location();team=f"/locations/{l}/members"
        self.assertEqual(http("DELETE",team+"/"+self.user_id,token=self.token)[0],409)
        self.assertEqual(http("PUT",team+"/"+self.user_id,{"role":"viewer"},self.token)[0],409)
        username,user,token,_=self.account()
        self.assertEqual(http("POST",team,{"username":username,"role":"admin"},self.token)[0],201)
        with ThreadPoolExecutor(max_workers=2) as pool:
            tasks=[pool.submit(http,"PUT",team+"/"+uid,{"role":"viewer"},t) for uid,t in [(self.user_id,self.token),(user,token)]]
            self.assertEqual(sorted(task.result()[0] for task in tasks),[200,409])
        members=http("GET",team,token=self.token)[1];admins=[m for m in members if m["role"]=="admin"];self.assertEqual(len(admins),1)
        admin=self.token if admins[0]["id"]==self.user_id else token
        self.assertEqual(http("DELETE",team+"/"+admins[0]["id"],token=admin)[0],409)
if __name__=="__main__":unittest.main(verbosity=2)
