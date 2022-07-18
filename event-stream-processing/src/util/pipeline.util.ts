import {
  KinesisStreamRecordDecodeFailure,
  OsDocumentProcessingFailure,
  OsDocumentCommitFailure,
  PipelineObject,
  OsDocumentPipeline,
} from '../types/os-document';

export function partitionObjectInPipeline(
  tuple: OsDocumentPipeline, pipelineObject: PipelineObject): OsDocumentPipeline {
  if (pipelineObject instanceof KinesisStreamRecordDecodeFailure ||
    pipelineObject instanceof OsDocumentProcessingFailure ||
    pipelineObject instanceof OsDocumentCommitFailure) {
    tuple.failures.push(pipelineObject);
  } else {
    tuple.documents.push(pipelineObject);
  }
  return tuple;
}

export function buildOsDocumentPipeline(pipeline?: OsDocumentPipeline): OsDocumentPipeline {
  const rVal = new OsDocumentPipeline();
  if (pipeline?.failures) {
    rVal.failures = pipeline.failures;
  }
  return rVal;
}
