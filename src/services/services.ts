import { Service } from './service';

export class Services {
    services: ServicesHash;
    parameters: ParametersHash;
    constructor() {
        this.services = {};
        this.parameters = {};
    }
    addService(key, service: Service) {
        this.services[key] = service;
    }
    addServices(services: Array<Service>) {
        services.forEach(service => {
            this.services[service.id] = service;
        })
    }
    addParameter(key, value) {
        this.parameters[key] = value;
    }
    addParameters(parameters: {}) {
        Object.keys(parameters).forEach(key => {
            this.parameters[key] = parameters[key];
        })
    }
    getServicesIds(): Array<string> {
        return Object.keys(this.services);
    }
    getParameters(): Array<string> {
        return Object.keys(this.parameters);
    }
}

interface ServicesHash {
    [id: string]: Service
}

interface ParametersHash {
    [id: string]: string
}