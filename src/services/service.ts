export const containerCompleteClass = {
    container: 'Symfony\Component\DependencyInjectio\ContainerInterface',
    containerBuilder: 'Symfony\Component\DependencyInjectio\ContainerBuilder',
    decorator: 'Symfony\Component\DependencyInjectio\DefinitionDecorator',
    definition: 'Symfony\Component\DependencyInjectio\Definition',
    reference: 'Symfony\Component\DependencyInjectio\Reference'
}
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
export class Service {
    arguments: Array<Argument>;
    id: string
    class: string
    tags: {}
    isAbstract: boolean

    constructor(id: string, className: string) {
        this.id = id;
        this.class = className;
        this.isAbstract = false;
    }
    addArgument(key: number, argument: Argument) {
        this.arguments[key] = argument;
    }
    addArguments(args: Array<Argument>) {
        this.arguments = args;
    }
    abstract() {
        this.isAbstract = true;
    }
}

export class ServiceArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class TextArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class ParameterArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class CollectionArgument implements Argument {
    value: Array<Argument>
    constructor(value: Array<Argument>) {
        this.value = value;
    }
}

export interface Argument {
}