// Tests the entrypoint auto-start condition without opening a real server.
// This is important for SonarQube "coverage on new code" because the auto-start branch
// would otherwise be marked uncovered by the normal HTTP-based tests.

import type http from 'http';

describe('notification-service entrypoint auto-start', () => {
    it('should call app.listen when NOTIFICATION_SERVICE_AUTO_START=true', async () => {
        jest.resetModules();

        const originalEnv = process.env.NOTIFICATION_SERVICE_AUTO_START;
        process.env.NOTIFICATION_SERVICE_AUTO_START = 'true';

        const listenMock = jest.fn().mockImplementation((_port: any, _host: any, cb: any) => {
            if (typeof cb === 'function') cb();
            return {
                on: jest.fn(),
                close: jest.fn(),
            } as any as http.Server;
        });

        const appMock = {
            use: jest.fn(),
            get: jest.fn(),
            post: jest.fn(),
            listen: listenMock,
        };

        jest.doMock('express', () => {
            const mockExpress = jest.fn(() => appMock);
            (mockExpress as any).json = jest.fn(() => jest.fn());
            return mockExpress;
        });

        await jest.isolateModulesAsync(async () => {
            await import('../src/main');
        });

        expect(listenMock).toHaveBeenCalled();

        process.env.NOTIFICATION_SERVICE_AUTO_START = originalEnv;
        jest.dontMock('express');
    });
});

