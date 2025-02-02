// src/tests/backendTest.ts
import axios from 'axios';
import WebSocket from 'ws';
const API_BASE_URL = 'http://localhost:3000/api/trpc';
const WEBSOCKET_URL = 'ws://localhost:8080';
// Test Components
const testComponents = [
    { name: 'Test Service 1', url: 'https://httpstat.us/200', status: 'UNKNOWN' },
    { name: 'Test Service 2', url: 'https://httpstat.us/500', status: 'UNKNOWN' },
];
const runTests = async () => {
    console.log('Starting backend tests...');
    // Step 1: Connect to WebSocket Server
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.on('open', () => console.log('WebSocket connected successfully.'));
    ws.on('message', (message) => console.log('WebSocket Update:', message.toString()));
    // Step 2: Create Components
    const createdComponents = [];
    for (const component of testComponents) {
        try {
            const response = await axios.post(`${API_BASE_URL}/component.createComponent`, {
                input: {
                    groupId: '00000000-0000-0000-0000-000000000001', // Use valid group ID
                    orgId: '00000000-0000-0000-0000-000000000001', // Use valid org ID
                    name: component.name,
                    description: `${component.name} description`,
                    url: component.url,
                    status: component.status,
                },
            });
            console.log(`Created component: ${component.name}`);
            createdComponents.push(response.data);
        }
        catch (error) {
            console.error(`Error creating component: ${component.name}`, error);
        }
    }
    // Step 3: Simulate Status Updates
    for (const component of createdComponents) {
        try {
            await axios.post(`${API_BASE_URL}/component.updateComponentStatus`, {
                input: {
                    componentId: component.id,
                    status: 'OPERATIONAL',
                },
            });
            console.log(`Updated status for component: ${component.name}`);
        }
        catch (error) {
            console.error(`Error updating status for component: ${component.name}`, error);
        }
    }
    // Step 4: Delete Components
    for (const component of createdComponents) {
        try {
            await axios.post(`${API_BASE_URL}/component.deleteComponent`, {
                input: {
                    componentId: component.id,
                },
            });
            console.log(`Deleted component: ${component.name}`);
        }
        catch (error) {
            console.error(`Error deleting component: ${component.name}`, error);
        }
    }
    // Step 5: WebSocket Close
    ws.close();
    console.log('Backend tests completed successfully.');
};
runTests().catch((err) => console.error('Test execution failed:', err));
