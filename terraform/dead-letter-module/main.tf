terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
  }
}

resource "aws_kinesis_firehose_delivery_stream" "s3_dlq_stream" {
  name        = var.dlq_stream_name
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn   = aws_iam_role.s3_dql_role.arn
    bucket_arn = aws_s3_bucket.dlq.arn

    prefix              = "year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/"

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

resource "aws_s3_bucket" "dlq" {
  bucket = "${var.es_domain_name}-dlq-${ var.aws_account_id }"
}

resource "aws_s3_bucket_acl" "dlq" {
  bucket = aws_s3_bucket.dlq.id
  acl    = "private"
}

resource "aws_iam_role" "s3_dql_role" {
  name = "${var.es_domain_name}-opensearch-dlq"
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
            "aws:SourceArn": var.lambda_iit_agents_arn
          }
        }
      },
    ]
  })
  inline_policy {
    name = "opensearch_dlq_policy"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["s3:ListBucket"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.dlq.id}"]
        },
        {
          Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.dlq.id}/*"]
        },
      ]
    })
   }
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

