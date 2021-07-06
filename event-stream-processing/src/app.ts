import {myContainer, TYPES} from './inversify.config';
import {KinesisStreamEvent, Context} from 'aws-lambda';
import {KinesisStreamHandler} from './kinesisStreamHandler.isvc';

export const kinesisStreamHandler = async (event: KinesisStreamEvent, context: Context):Promise<void> => {
  return myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).handle(event, context)
    .catch((error) => {
      console.error(error);
    });
};

/**
 * This function is for debugging purposes to help with exploring lambda layers
 */
export const listAllFiles = async (event: KinesisStreamEvent, context: Context):Promise<void> => {
  const fs = await import('fs');
  const path = await import('path');
  const findFiles = (dirPath:string, regex: RegExp)=>{
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      console.log('# '+filePath);
      if (fs.statSync(filePath).isDirectory()) {
        if (
          file !== 'node_modules' &&
          filePath !== '/dev' &&
          filePath !== '/proc' &&
          filePath !== '/etc' &&
          filePath !== '/lib' &&
          filePath !== '/lib64' &&
          filePath !== '/root' &&
          filePath !== '/bin' &&
          filePath !== '/sbin' &&
          filePath !== '/sys' &&
          filePath !== '/usr' &&
          filePath !== '/var'
        ) {
          findFiles(filePath, regex);
        }
      } else {
        if (regex.exec(file)) {
          console.log(filePath);
        }
      }
    }
  };
  return new Promise((resolve, reject) => {
    console.log(`cwd: ${process.cwd()}`);
    findFiles('/', /\.mmdb$/);
  });
};
