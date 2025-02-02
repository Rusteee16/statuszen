import axios from 'axios';
import WebSocket from 'ws';

const API_BASE_URL = 'http://localhost:3000/api/trpc';
const WEBSOCKET_URL = 'ws://localhost:8080'; 
// Adjust this to match your actual WebSocket server URL/port

// Replace these with valid IDs or remove them if you plan to create them within this test
const testData = {
  orgId: '00000000-0000-0000-0000-000000000001', 
  groupId: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000001',
};

const logResult = (message: string, success: boolean) => {
  console.log(`${success ? '✅' : '❌'} ${message}`);
};

async function testWebSocket() {
  console.log('Testing WebSocket connection...');

  return new Promise<void>((resolve) => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.on('open', () => {
      logResult('WebSocket connected successfully.', true);
      ws.close();
      resolve();
    });

    ws.on('error', (err) => {
      logResult(`WebSocket connection failed: ${err.message}`, false);
      resolve();
    });
  });
}

async function testCreateOrganization() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/organization.createOrganization.mutation`,
      {
        input: { name: 'Test Organization' },
      }
    );
    logResult('Organization created successfully.', true);
    return response.data;
  } catch (error: any) {
    logResult(
      `Failed to create organization: ${error.response?.data?.message || error.message}`,
      false
    );
  }
}

async function testCreateGroup() {
  try {
    const response = await axios.post(`${API_BASE_URL}/group.createGroup.mutation`, {
      input: {
        orgId: testData.orgId,
        name: 'Test Group',
        description: 'A test group description',
      },
    });
    logResult('Group created successfully.', true);
    return response.data;
  } catch (error: any) {
    logResult(
      `Failed to create group: ${error.response?.data?.message || error.message}`,
      false
    );
  }
}

async function testCreateUser() {
  try {
    const response = await axios.post(`${API_BASE_URL}/user.createUser.mutation`, {
      input: {
        orgId: testData.orgId,
        fname: 'John',
        lname: 'Doe',
        email: 'johndoe@example.com',
        clerkId: 'clerk123',
        role: 'admin',
      },
    });
    logResult('User created successfully.', true);
    return response.data;
  } catch (error: any) {
    logResult(
      `Failed to create user: ${error.response?.data?.message || error.message}`,
      false
    );
  }
}

async function testCreateIncident() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/incident.createIncident.mutation`,
      {
        input: {
          componentId: testData.groupId, // If "componentId" is a separate entity, adjust accordingly
          title: 'Test Incident',
          description: 'Incident during testing.',
          status: 'ongoing',
        },
      }
    );
    logResult('Incident created successfully.', true);
    return response.data;
  } catch (error: any) {
    logResult(
      `Failed to create incident: ${error.response?.data?.message || error.message}`,
      false
    );
  }
}

async function runTests() {
  console.log('Starting API tests...');

  await testWebSocket();
  await testCreateOrganization();
  await testCreateGroup();
  await testCreateUser();
  await testCreateIncident();

  console.log('API tests completed.');
}

runTests().catch((error: any) => {
  console.error('Detailed Error:', error.response?.data || error.message);
});
