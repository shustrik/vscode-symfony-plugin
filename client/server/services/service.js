"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
exports.containerCompleteClass = {
    container: 'Symfony\\Component\\DependencyInjection\\ContainerInterface',
    controllerContainer: 'Symfony\\Bundle\\FrameworkBundle\\Controller\\Controller',
    containerBuilder: 'Symfony\\Component\\DependencyInjection\\ContainerBuilder',
    decorator: 'Symfony\\Component\\DependencyInjection\\DefinitionDecorator',
    definition: 'Symfony\\Component\\DependencyInjection\\Definition',
    reference: 'Symfony\\Component\\DependencyInjection\\Reference',
    containerCommand: 'Symfony\\Bundle\\FrameworkBundle\\Command\\ContainerAwareCommand',
};
exports.containerCalls = {
    get: 'get',
    getContainer: 'getContainer',
    getParameter: 'getParameter',
    getDefinition: 'getDefinition',
    hasDefinition: 'hasDefinition',
};
class Services {
    constructor() {
        this.services = {};
        this.parameters = {};
        this.pathServices = {};
        this.pathParameters = {};
        this.autoconfigure = new Array();
    }
    addAutoconfigure(autoconfigure) {
        this.autoconfigure.push(autoconfigure);
    }
    addService(key, service, path) {
        if (path) {
            this.pathServices[path] = this.pathServices[path] ? this.pathServices[path] : new Array();
            this.pathServices[path].push(service.id);
        }
        this.services[key] = service;
    }
    addServices(services, path) {
        if (path) {
            this.pathServices[path] = this.pathServices[path] ? this.pathServices[path] : new Array();
        }
        services.forEach(service => {
            this.services[service.id] = service;
            if (path) {
                this.pathServices[path].push(service.id);
            }
        });
    }
    addParameter(key, value, path) {
        if (path) {
            this.pathParameters[path] = this.pathParameters[path] ? this.pathParameters[path] : new Array();
            this.pathParameters[path].push(key);
        }
        this.parameters[key] = value;
    }
    addParameters(parameters, path) {
        if (path) {
            this.pathParameters[path] = this.pathParameters[path] ? this.pathParameters[path] : new Array();
        }
        Object.keys(parameters).forEach(key => {
            this.parameters[key] = parameters[key];
            if (path) {
                this.pathParameters[path].push(key);
            }
        });
    }
    removePathDeps(path) {
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
    getServicesIds() {
        return Object.keys(this.services);
    }
    getTags() {
        let result = new Array();
        Object.keys(this.services).forEach(key => {
            Object.keys(this.services[key].getTags()).forEach(key => {
                if (!result.includes(key)) {
                    result.push(key);
                }
            });
        });
        return result;
    }
    getParameters() {
        return Object.keys(this.parameters);
    }
    getService(id) {
        let service = this.services[id];
        return service ? service : null;
    }
    getServiceByClass(className) {
        let service = null;
        Object.keys(this.services).some(key => {
            if (this.services[key].getClass() == className) {
                service = this.services[key];
                return true;
            }
        });
        return service;
    }
}
exports.Services = Services;
class Tag {
    constructor(name) {
        this.name = name;
        this.attributes = {};
    }
    addAttribute(key, value) {
        this.attributes[key] = value;
    }
}
exports.Tag = Tag;
class Autoconfigure {
    constructor(key, resource) {
        this.key = key;
        this.resource = resource;
        this.isPublic = true;
        this.tags = {};
    }
    setExclude(pattern) {
        this.exclude = pattern;
    }
    addTags(tags) {
        Object.keys(tags).forEach(tag => {
            this.tags[tags[tag]['name']] = tags[tag];
        });
    }
    private() {
        this.isPublic = false;
    }
}
exports.Autoconfigure = Autoconfigure;
class Service {
    constructor(id, className, start, path) {
        this.id = id;
        this.class = className;
        this.isAbstract = false;
        this.arguments = new Array();
        this.start = start;
        this.tags = {};
        this.path = path;
        this.public = true;
    }
    addArgument(key, argument) {
        this.arguments[key] = argument;
    }
    addArguments(args) {
        this.arguments = args;
    }
    addTags(tags) {
        Object.keys(tags).forEach(tag => {
            this.tags[tags[tag]['name']] = tags[tag];
        });
    }
    getTags() {
        return this.tags;
    }
    abstract() {
        this.isAbstract = true;
    }
    getRange() {
        return vscode_languageserver_1.Range.create(this.start, this.start);
    }
    getPath() {
        return this.path;
    }
    getClass() {
        return this.class;
    }
    private() {
        this.public = false;
    }
}
exports.Service = Service;
class ServiceArgument {
    constructor(value) {
        this.value = value;
    }
}
exports.ServiceArgument = ServiceArgument;
class TextArgument {
    constructor(value) {
        this.value = value;
    }
}
exports.TextArgument = TextArgument;
class ParameterArgument {
    constructor(value) {
        this.value = value;
    }
}
exports.ParameterArgument = ParameterArgument;
class CollectionArgument {
    constructor(value) {
        this.value = value;
    }
}
exports.CollectionArgument = CollectionArgument;
//# sourceMappingURL=service.js.map