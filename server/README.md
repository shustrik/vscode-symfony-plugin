# symfony README
Alfa version extension for symfony. Extension provide service completion and services method completion.

If vendor folder excluded - symfony services not provide

## Features
* Parse YAML, XML service configuration file
* Parse DependencyInjection Configuration file
* Services completion in xml and yaml files
* Services completion in symfony controller
* Services completion in create service definition

## Extension Settings

## Known Issues
* $this->getContainer()->get ContainerAwareCommand
* когда идет апдейт документа не верно работает автокомплит
* Go to service description from class
* Symfony 3.3 autoconfigure 
* Split public and private services
* Form completion helper
* Parse php service configuration file
* Tests

Request textDocument/completion failed.
  Message: Request textDocument/completion failed with message: Illegal value for `line`
  Code: -32603 

## Release Notes
