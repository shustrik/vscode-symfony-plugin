import { Service } from './service';

export class Services {
    services: Service[];
    parameters: {};
    constructor() {
        this.services = [];
        this.parameters = [];   
    }
    addService(key, service) {
        this.services[key] = new Service(service)
    }
    addParameter(key, value) {
        this.parameters[key] = value;
    }
    getServicesIds(): Array<string> {
        return Object.keys(this.services);
    }
    getParameters(): Array<string> {
        return Object.keys(this.parameters);
    }
}