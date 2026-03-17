import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDuration } from './metrics.controller';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Skip metrics and health endpoints to avoid noise
        if (req.originalUrl.includes('/api/metrics') || req.originalUrl.includes('/api/health')) {
            return next();
        }

        const start = process.hrtime.bigint();

        res.on('finish', () => {
            const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
            const route = req.route?.path || req.originalUrl;
            const labels = {
                method: req.method,
                route,
                status_code: res.statusCode.toString(),
            };

            httpRequestsTotal.inc(labels);
            httpRequestDuration.observe(labels, durationSec);
        });

        next();
    }
}
