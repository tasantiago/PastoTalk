import { Button, Col, Form, Input, Row, message } from 'antd';
import { useAuth } from '../../context/AuthProvider/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  async function onFinish(values: { username: string; password: string }) {
    try {
      await auth.authenticate(values.username, values.password);

      navigate('/profile');
    } catch (error) {
      message.error('Invalid email or password');
    }
  }

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: '100vh',
      }}
    >
      <Col span={100}>
        <Form name="basic" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={onFinish}>
          <Form.Item label="Email" name={'username'}>
            <Input />
          </Form.Item>

          <Form.Item label="Password" name={'password'}>
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};
