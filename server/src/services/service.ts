export const containerCompleteClass = {
    container: 'Symfony\\Component\\DependencyInjection\\ContainerInterface',
    controllerContainer: 'Symfony\\Bundle\\FrameworkBundle\\Controller\\Controller',
    containerBuilder: 'Symfony\\Component\\DependencyInjection\\ContainerBuilder',
    decorator: 'Symfony\\Component\\DependencyInjection\\DefinitionDecorator',
    definition: 'Symfony\\Component\\DependencyInjection\\Definition',
    reference: 'Symfony\\Component\\DependencyInjection\\Reference'
}
export class Services {
    services: ServicesHash;
    parameters: ParametersHash;
    pathServices: PathDepsHash;
    pathParameters: PathDepsHash;
    constructor() {
        this.services = {};
        this.parameters = {};
        this.pathServices = {};
        this.pathParameters = {};
    }
    addService(key, service: Service, path?: string) {
        if (path) {
            this.pathServices[path] = this.pathServices[path] ? this.pathServices[path] : new Array<string>();
            this.pathServices[path].push(service.id);
        }
        this.services[key] = service;
    }
    addServices(services: Array<Service>, path?: string) {
        if (path) {
            this.pathServices[path] = this.pathServices[path] ? this.pathServices[path] : new Array<string>();
        }
        services.forEach(service => {
            this.services[service.id] = service;
            if (path) {
                this.pathServices[path].push(service.id);
            }
        })
    }
    addParameter(key, value, path?: string) {
        if (path) {
            this.pathParameters[path] = this.pathParameters[path] ? this.pathParameters[path] : new Array<string>();
            this.pathParameters[path].push(key);
        }
        this.parameters[key] = value;
    }
    addParameters(parameters: {}, path?: string) {
        if (path) {
            this.pathParameters[path] = this.pathParameters[path] ? this.pathParameters[path] : new Array<string>();
        }
        Object.keys(parameters).forEach(key => {
            this.parameters[key] = parameters[key];
            if (path) {
                this.pathParameters[path].push(key);
            }
        })
    }
    removePathDeps(path: string) {
        if (this.pathParameters[path].length > 0) {
            this.pathParameters[path].forEach(element => {
                delete this.parameters[element];
            });
        }
        if (this.pathServices[path].length > 0) {
            this.pathServices[path].forEach(element => {
                delete this.services[element];
            });
        }
    }
    getServicesIds(): Array<string> {
        return Object.keys(this.services);
    }
    getTags(): Array<string> {
        let result = new Array();
        Object.keys(this.services).forEach(key => {
            console.log('sfd');
            Object.keys(this.services[key].getTags()).forEach(key => {
                if (!result.includes(key)) {
                    result.push(key);
                }
            });
        });
        return result;
    }
    getParameters(): Array<string> {
        return Object.keys(this.parameters);
    }
    getServiceClass(id: string) {
        let service = this.services[id];
        return service ? service.class : null;
    }
}

interface ServicesHash {
    [id: string]: Service
}

interface ParametersHash {
    [id: string]: string
}
interface PathDepsHash {
    [id: string]: Array<string>
}

interface TagHash {
    [id: string]: Tag
}
export class Tag {
    name: string
    attributes: ParametersHash
    constructor(name: string) {
        this.name = name;
        this.attributes = {};
    }
    addAttribute(key, value) {
        this.attributes[key] = value;
    }
}

export class Service {
    arguments: Array<Argument>;
    id: string
    class: string
    tags: TagHash
    isAbstract: boolean

    constructor(id: string, className: string) {
        this.id = id;
        this.class = className;
        this.isAbstract = false;
        this.arguments = new Array();
        this.tags = {};
    }
    addArgument(key: number, argument: Argument) {
        this.arguments[key] = argument;
    }
    addArguments(args: Array<Argument>) {
        this.arguments = args;
    }
    addTags(tags) {
        Object.keys(tags).forEach(tag => {
            this.tags[tags[tag]['name']] = tags[tag]
        });
    }
    getTags() {
        return this.tags;
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
