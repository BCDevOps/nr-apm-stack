terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
  }
}

resource "aws_sns_topic" "topic" {
  name          = var.topic["name"]
  display_name  = var.topic["display"]
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
      "Resource": "arn:aws:sns:${var.aws_region_name}:${var.aws_account_id}:${var.topic.resourceId}",
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

output "topic_id" {
  value = aws_sns_topic.topic.id
}
