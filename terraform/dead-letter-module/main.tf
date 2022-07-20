terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
  }
}

# Stream
resource "aws_kinesis_firehose_delivery_stream" "s3_dlq_stream" {
  name        = var.dlq_stream_name
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn   = aws_iam_role.firehose_role.arn
    bucket_arn = aws_s3_bucket.dlq.arn

    prefix              = "year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/"
    error_output_prefix = "errors/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/!{firehose:error-output-type}/"

    # https://docs.aws.amazon.com/firehose/latest/dev/dynamic-partitioning.html
    buffer_size = 64
    compression_format = "GZIP"

    processing_configuration {
      enabled = "true"

      # Multi-record deaggregation processor example
      processors {
        type = "RecordDeAggregation"
        parameters {
          parameter_name  = "SubRecordType"
          parameter_value = "JSON"
        }
      }

      # New line delimiter processor example
      processors {
        type = "AppendDelimiterToRecord"
      }
    }
  }
}
resource "aws_iam_role" "firehose_role" {
  name = "${var.es_domain_name}-firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "firehose.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.aws_account_id
          },
          ArnLike = {
            "aws:SourceArn": "arn:aws:kinesis:${var.aws_region_name}:${var.aws_account_id}:stream/${var.dlq_stream_name}"
          }
        }
      },
    ]
  })
  inline_policy {
    name = "kinesis-s3-inline-policy"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow",
          Action = [
            "s3:AbortMultipartUpload",
            "s3:GetBucketLocation",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:PutObject"
          ]
          Resource = [
            "arn:aws:s3:::${aws_s3_bucket.dlq.id}",
            "arn:aws:s3:::${aws_s3_bucket.dlq.id}/*"
          ]
        },
        {
          Effect = "Allow"
          Action = [
            "kinesis:DescribeStream",
            "kinesis:GetShardIterator",
            "kinesis:GetRecords",
            "kinesis:ListShards"
          ]
          Resource = "arn:aws:kinesis:${var.aws_region_name}:${var.aws_account_id}:stream/${var.dlq_stream_name}"
        }
      ]
    })
  }
}

# s3 Bucket
resource "aws_s3_bucket" "dlq" {
  bucket = "${var.es_domain_name}-dlq-${ var.aws_account_id }"
}

resource "aws_s3_bucket_acl" "dlq" {
  bucket = aws_s3_bucket.dlq.id
  acl    = "private"
}

 resource "aws_s3_bucket_server_side_encryption_configuration" "s3_dlq_bucket_encrypted" {
   bucket = aws_s3_bucket.dlq.id

   rule {
     apply_server_side_encryption_by_default {
       sse_algorithm     = "AES256"
     }
     bucket_key_enabled = true
   }
 }
