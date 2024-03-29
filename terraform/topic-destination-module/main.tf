terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.6.2"
    }
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.7"
    }
  }
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
      "arn:aws:sqs:${var.aws_region_name}:${var.aws_account_id}:${var.es_domain_name}-${var.topic.resourceId}",
    ]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        "arn:aws:sns:${var.aws_region_name}:${var.aws_account_id}:${var.es_domain_name}-${var.topic.resourceId}",
      ]
    }
  }
}

# This policy needs to be attached to a SA role by the platform team
resource "aws_iam_policy" "sqs-queue-consumer-policy" {
  count       = var.topic.sqsEndpoint ? 1 : 0
  name        = "${var.es_domain_name}-${var.topic.resourceId}-sqs-consumer"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    "Statement": [
        {
            "Sid": "AllowConsumerAccessToSQS",
            "Effect": "Allow",
            "Action": [
              "sqs:DeleteMessage",
              "sqs:ReceiveMessage"
            ],
            "Resource": "arn:aws:sqs:${var.aws_region_name}:${var.aws_account_id}:${var.es_domain_name}-${var.topic.resourceId}"
        }
    ]
  })
}

resource "aws_sqs_queue" "sqs-queue" {
  count    = var.topic.sqsEndpoint ? 1 : 0
  name     = "${var.es_domain_name}-${var.topic.resourceId}"
  policy   = data.aws_iam_policy_document.sqs-queue-policy.json
}

resource "aws_sns_topic_subscription" "sqs-queue-subscription" {
  count    = var.topic.sqsEndpoint ? 1 : 0
  topic_arn = var.aws_sns_topic_id
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.sqs-queue[count.index].arn
}
