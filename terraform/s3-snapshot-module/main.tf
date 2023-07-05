terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.6.2"
    }
  }
}

resource "aws_s3_bucket" "snapshots" {
  bucket = "${var.es_domain_name}-snapshot-${ var.aws_account_id }"
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_acl" "snapshots" {
  bucket = aws_s3_bucket.snapshots.id
  acl    = "private"
}

resource "aws_iam_role" "snapshot_role" {
  name = "${var.es_domain_name}-opensearch-snapshot"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "opensearchservice.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.aws_account_id
          },
          ArnLike = {
            "aws:SourceArn": "arn:aws:es:${var.aws_region_name}:${var.aws_account_id}:domain/${var.es_domain_name}"
          }
        }
      },
    ]
  })
  inline_policy {
    name = "opensearch_snapshot_policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["s3:ListBucket"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.snapshots.id}"]
        },
        {
          Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.snapshots.id}/*"]
        },
      ]
    })
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_bucket_encrypted" {
  bucket = aws_s3_bucket.snapshots.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
    bucket_key_enabled = true
  }
}
