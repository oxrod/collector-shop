import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../src/modules/health/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

const mockHealthCheckService = { check: jest.fn().mockResolvedValue({ status: 'ok', details: { database: { status: 'up' } } }) };
const mockTypeOrmHealthIndicator = { pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }) };

describe('HealthController', () => {
    let controller: HealthController;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                { provide: HealthCheckService, useValue: mockHealthCheckService },
                { provide: TypeOrmHealthIndicator, useValue: mockTypeOrmHealthIndicator },
            ],
        }).compile();
        controller = module.get<HealthController>(HealthController);
    });
    afterEach(() => jest.clearAllMocks());
    it('should be defined', () => { expect(controller).toBeDefined(); });
    it('should return health status', async () => {
        const result = await controller.check();
        expect(result).toEqual({ status: 'ok', details: { database: { status: 'up' } } });
        expect(mockHealthCheckService.check).toHaveBeenCalled();
    });
});
