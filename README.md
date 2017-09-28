
## Microservice Template ##

Let's start building independent reusable secured serverless services with AWS! 

Table of Contents

  * [Purpose](#purpose)
  * [Prerequisites](#prerequisites)
  * [Instructions](#instructions)
  * [Sections](#sections)


### Purpose
To avoid studying and integrating the same thing every time there's a new project.  Microservices has also these advantages:

 - Single Responsibility Principle
 - Flexible 
 - Easy to enhance 
 - Easy to understand
 - Freedom to choose technology (..but *NodeJS is the way XD*)

### Prerequisites
Before we create a new microservice project, be sure you've pretty setup your environment to work on and do the following:

 1. Create a brief technical document for your microservice. (See this section below)
 2. Install NodeJS.
 2. Get an IAM Account with Full Deployment Access. 
 2. Install Serverless version 1.18~
 3. Configure your AWS Profile. 

See Link for configuring AWS Profile :
https://serverless.com/framework/docs/providers/aws/guide/credentials/

### Instructions

 1. Run `serverless create --template aws-nodejs --path microservicename`
 2. Initialiaze a package.json file run `npm init`
 3. Copy the contents of this repository's package.json.
 4. Create a serverless folder and create a build folder inside it.
 5. Copy the package.json inside the serverless but be sure to remove the devDependencies attributes and scripts attributes. You won't need these anyway in your main package.
 5. Create a service folder and create an index.js as your main Javascript file to edit.
 5. Edit the serverless.yml according to the requirements of the microservice your going to create. See sample in this repository.
 6. Everytime you make changes, be sure you've run `npm run build` or your script contains that command.
 7. You may now start. Happy coding!
 


### Sections

#### Creating a technical document

Helps any tech to discover what your microservice can do and also to understand how your microservice operates. Important content of a technical document are the ff:

 - Prerequisites - The components/technologies you're going to use
 - Functions - The functions of your microservice
 - Business Steps - How you vision others to integrate your service.


#### File Structure

**service** folder will be our main folder for coding. You can use es6 style coding and the build script will compile it for you.

**serverless** folder will be our main package folder to deploy in AWS.
 
**serverless/build** folder will contain the compiled javascript codes of your service and it will be the one to be used when invoking your lambda function as you reference it in your serverless.yml

 
