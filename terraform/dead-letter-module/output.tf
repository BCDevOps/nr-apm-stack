output "kinesis_firehose_dlq_arn" {
  value = aws_kinesis_firehose_delivery_stream.s3_dlq_stream.arn
}
