"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containerCompleteClass = {
    container: 'Symfony\\Component\\DependencyInjection\\ContainerInterface',
    controllerContainer: 'Symfony\\Bundle\\FrameworkBundle\\Controller\\Controller',
    containerBuilder: 'Symfony\\Component\\DependencyInjection\\ContainerBuilder',
    decorator: 'Symfony\\Component\\DependencyInjection\\DefinitionDecorator',
    definition: 'Symfony\\Component\\DependencyInjection\\Definition',
    reference: 'Symfony\\Component\\DependencyInjection\\Reference'
};
class Services {
    constructor() {
        this.services = {};
        this.parameters = {};
    }
    addService(key, service) {
        this.services[key] = service;
    }
    addServices(services) {
        services.forEach(service => {
            this.services[service.id] = service;
        });
    }
    addParameter(key, value) {
        this.parameters[key] = value;
    }
    addParameters(parameters) {
        Object.keys(parameters).forEach(key => {
            this.parameters[key] = parameters[key];
        });
    }
    getServicesIds() {
        return Object.keys(this.services);
    }
    getParameters() {
        return Object.keys(this.parameters);
    }
}
exports.Services = Services;
class Service {
    constructor(id, className) {
        this.id = id;
        this.class = className;
        this.isAbstract = false;
    }
    addArgument(key, argument) {
        this.arguments[key] = argument;
    }
    addArguments(args) {
        this.arguments = args;
    }
    abstract() {
        this.isAbstract = true;
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