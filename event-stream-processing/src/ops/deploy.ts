import {LambdaClient, UpdateFunctionCodeCommand, UpdateFunctionCodeCommandInput, CreateFunctionCommand, CreateFunctionCommandInput} from '@aws-sdk/client-lambda'
import * as fs from 'fs'
import * as path from 'path'

(async function() {
    const client = new LambdaClient({});
    const argv = process.argv.slice(2);
    const functionName = argv[0]

    //TODO: Create LogGroup: /aws/lambda/nress-dev-0-iit-agents
    //TODO: Create Role
    const zipFileBuffer = fs.readFileSync(path.resolve(__dirname, '../../event-stream-processing.zip'))
    const createFunctionCommandInput: CreateFunctionCommandInput = {
        FunctionName: functionName,
        Role: 'arn:aws:iam::675958891276:role/service-role/nress-dev-0-stream-to-es-role-qunq3tx6',
        Code: {ZipFile: zipFileBuffer},
        Runtime: "nodejs12.x",
        Handler: "index.kinesisStreamHandler"
    }
    const createFunctionCommand = new CreateFunctionCommand(createFunctionCommandInput)
    try {
        const createFunctionCommandutput = await client.send(createFunctionCommand)
        console.dir(createFunctionCommandutput)
    } catch (error) {
        if (!(error.name === 'ResourceConflictException' && error.message.startsWith('Function already exist:'))) {
            throw error
        }
    }
    const updateFunctionCodeCommandInput: UpdateFunctionCodeCommandInput = {
        FunctionName: functionName,
        ZipFile: zipFileBuffer
    }
    const updateFunctionCodeCommand = new UpdateFunctionCodeCommand(updateFunctionCodeCommandInput)
    const updateFunctionCodeCommandOutput = await client.send(updateFunctionCodeCommand)
    console.dir(updateFunctionCodeCommandOutput)
}())