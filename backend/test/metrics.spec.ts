import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from '../src/modules/metrics/metrics.controller';
import { MetricsMiddleware } from '../src/modules/metrics/metrics.middleware';
const mockRes = { set: jest.fn(), end: jest.fn() };

describe('MetricsController', () => {
    let controller: MetricsController;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MetricsController],
        }).compile();
        controller = module.get<MetricsController>(MetricsController);
    });
    it('should be defined', () => { expect(controller).toBeDefined(); });
    it('should return metrics', async () => {
        await controller.getMetrics(mockRes as any);
        expect(mockRes.set).toHaveBeenCalled();
        expect(mockRes.end).toHaveBeenCalled();
    });
});

describe('MetricsMiddleware', () => {
    let middleware: MetricsMiddleware;
    beforeEach(() => { middleware = new MetricsMiddleware(); });

    it('should skip metrics endpoint', () => {
        const req = { originalUrl: '/api/metrics' } as any;
        const res = { on: jest.fn() } as any;
        const next = jest.fn();
        middleware.use(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.on).not.toHaveBeenCalled();
    });
    it('should skip health endpoint', () => {
        const req = { originalUrl: '/api/health' } as any;
        const res = { on: jest.fn() } as any;
        const next = jest.fn();
        middleware.use(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.on).not.toHaveBeenCalled();
    });
    it('should track metrics for other endpoints', () => {
        const req = { originalUrl: '/api/articles', method: 'GET' } as any;
        const finishCallback: Function[] = [];
        const res = { on: jest.fn((event: string, cb: Function) => { finishCallback.push(cb); }), statusCode: 200 } as any;
        const next = jest.fn();
        middleware.use(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        // Trigger the finish callback
        finishCallback[0]();
    });
});
