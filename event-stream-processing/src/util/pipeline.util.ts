import {
  KinesisStreamRecordProcessingFailure, OsDocumentProcessingFailure, PipelineObject, OsDocumentPipeline,
} from '../types/os-document';

export function partitionObjectInPipeline(
  tuple: OsDocumentPipeline, pipelineObject: PipelineObject): OsDocumentPipeline {
  if (pipelineObject instanceof OsDocumentProcessingFailure ||
    pipelineObject instanceof KinesisStreamRecordProcessingFailure) {
    tuple.failures.push(pipelineObject);
  } else {
    tuple.documents.push(pipelineObject);
  }
  return tuple;
}

export function buildOsDocumentPipeline(pipeline?: OsDocumentPipeline): OsDocumentPipeline {
  return {
    documents: [],
    failures: pipeline ? pipeline.failures : [],
  };
}
