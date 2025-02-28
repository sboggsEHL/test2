// Updated encompass.module.ts with full logging for payloads and responses

import { Router } from 'express';
import { EncompassController } from './encompass.controller';
import EncompassService from './encompass.service';

export class EncompassModule {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const service = new EncompassService();
        const controller = new EncompassController(service);

        console.log('Initializing Encompass routes...');

        this.router.get('/token', (req, res, next) => {
            console.log('GET /api/encompass/token called', {
                headers: req.headers,
                body: req.body
            });
            next();
        }, controller.getToken.bind(controller));

        this.router.get('/loan_schema', async (req, res, next) => {
            console.log('GET /api/encompass/loan_schema called', {
                headers: req.headers,  
                body: req.body
            });
            next();
        }, controller.getLoanSchema.bind(controller));

        this.router.get('/custom_schema', async (req, res, next) => {
            console.log('GET /api/encompass/custom_schema called', {
                headers: req.headers,
                body: req.body
            });
            next();
        }, controller.getCustomSchema.bind(controller));

        this.router.post('/export', (req, res) => {
            // Directly invoke with (req, res) since the controller method expects these parameters
            controller.exportLead(req, res);
        });
    }
}
