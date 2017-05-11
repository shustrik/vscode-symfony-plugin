export class Service {
    arguments: string[]
    class: String
    tags: {};

    constructor(service: Object) {
        this.class = service.class;
        this.arguments = service.arguments;
    }
    getParameters() {
        let parameters = [];
        this.arguments.forEach(element => {
            if (element.match('%')) {
                parameters.push(element);
            }
        });
    }
}