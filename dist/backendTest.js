// src/tests/backendTest.ts
import axios from 'axios';
import WebSocket from 'ws';
const API_BASE_URL = 'http://localhost:3000/api/trpc';
const WEBSOCKET_URL = 'ws://localhost:8080';
const testData = {
    orgId: '00000000-0000-0000-0000-000000000001', // Replace with a valid org ID
    groupId: '00000000-0000-0000-0000-000000000001', // Replace with a valid group ID
    userId: '00000000-0000-0000-0000-000000000001', // Replace with a valid user ID
};
// Utility function to log results
const logResult = (message, success) => {
    console.log(`${success ? '✅' : '❌'} ${message}`);
};
const testWebSocket = async () => {
    console.log('Testing WebSocket connection...');
    return new Promise((resolve) => {
        const ws = new WebSocket(WEBSOCKET_URL);
        ws.on('open', () => {
            logResult('WebSocket connected successfully.', true);
            ws.close();
            resolve();
        });
        ws.on('error', () => {
            logResult('WebSocket connection failed.', false);
            resolve();
        });
    });
};
const testCreateOrganization = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/organization.createOrganization`, {
            input: { name: 'Test Organization' },
        });
        logResult('Organization created successfully.', true);
        return response.data;
    }
    catch (error) {
        logResult('Failed to create organization.', false);
    }
};
const testCreateGroup = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/group.createGroup`, {
            input: {
                orgId: testData.orgId,
                name: 'Test Group',
                description: 'A test group description',
            },
        });
        logResult('Group created successfully.', true);
        return response.data;
    }
    catch (error) {
        logResult('Failed to create group.', false);
    }
};
const testCreateUser = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user.createUser`, {
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
    }
    catch (error) {
        logResult('Failed to create user.', false);
    }
};
const testCreateIncident = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/incident.createIncident`, {
            input: {
                componentId: testData.groupId, // Assuming groupId is being reused for the test
                title: 'Test Incident',
                description: 'Incident during testing.',
                status: 'ongoing',
            },
        });
        logResult('Incident created successfully.', true);
        return response.data;
    }
    catch (error) {
        logResult('Failed to create incident.', false);
    }
};
const runTests = async () => {
    console.log('Starting API tests...');
    await testWebSocket();
    await testCreateOrganization();
    await testCreateGroup();
    await testCreateUser();
    await testCreateIncident();
    console.log('API tests completed.');
};
runTests().catch((err) => console.error('Test execution failed:', err));
