import {
  KinesisStreamRecordProcessingFailure, OsDocumentProcessingFailure, PipelineObject, PipelineTuple,
} from '../types/os-document';

export function partitionToTuple(tuple: PipelineTuple, pipelineObject: PipelineObject): PipelineTuple {
  if (pipelineObject instanceof OsDocumentProcessingFailure ||
    pipelineObject instanceof KinesisStreamRecordProcessingFailure) {
    tuple.failures.concat(pipelineObject);
  } else {
    tuple.documents.concat(pipelineObject);
  }
  return tuple;
}
