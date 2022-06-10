output "topic_id" {
  value = "arn:aws:sns:${var.aws_region_name}:${var.aws_account_id}:${aws_sns_topic.topic.id}"
}
