terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
  }
}

resource "aws_sns_topic" "topic" {
  name          = "${var.es_domain_name}-${var.topic.resourceId}"
  display_name  = var.topic.display
  policy        = <<EOF
{
  "Version": "2008-10-17",
  "Id": "__default_policy_ID",
  "Statement": [
    {
      "Sid": "__default_statement_ID",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": [
        "SNS:Publish",
        "SNS:RemovePermission",
        "SNS:SetTopicAttributes",
        "SNS:DeleteTopic",
        "SNS:ListSubscriptionsByTopic",
        "SNS:GetTopicAttributes",
        "SNS:AddPermission",
        "SNS:Subscribe"
      ],
      "Resource": "arn:aws:sns:${var.aws_region_name}:${var.aws_account_id}:${var.es_domain_name}-${var.topic.resourceId}",
      "Condition": {
        "StringEquals": {
          "AWS:SourceOwner": "${var.aws_account_id}"
        }
      }
    }
  ]
}
EOF
}
<<<<<<< HEAD
<<<<<<< HEAD
=======

resource "elasticsearch_opensearch_destination" "destination" {
  body = jsonencode({
    type = "sns"
    name = "${var.topic.display} SNS"
    sns = {
      role_arn = var.aws_sns_role_id
      topic_arn = aws_sns_topic.topic.id
    }
  })
}

data "aws_iam_policy_document" "sqs-queue-policy" {
  policy_id = "arn:aws:sqs:${var.aws_region_name}:${var.aws_account_id}:${var.es_domain_name}-${var.topic.resourceId}/SQSDefaultPolicy"

  statement {
    sid    = "sns-topic"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "SQS:SendMessage",
    ]

    resources = [
      "arn:aws:sqs:${var.aws_region_name}:${var.aws_account_id}:${var.topic.resourceId}",
    ]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        "arn:aws:sns:${var.aws_region_name}:${var.aws_account_id}:${var.topic.resourceId}",
      ]
    }
  }
}

resource "aws_sqs_queue" "sqs-queue" {
  count    = var.topic.sqsEndpoint ? 1 : 0
  name     = "${var.es_domain_name}-${var.topic.resourceId}"
  policy   = data.aws_iam_policy_document.sqs-queue-policy.json
}
>>>>>>> feat: add topic sqs and Opensearch destinations
=======
>>>>>>> fix: remove unnecessary
