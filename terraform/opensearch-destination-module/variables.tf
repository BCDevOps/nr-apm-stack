variable "topic" {
  description = "Topic details"
  type        = object({
    name = string
    display = string
    resourceId = string
    sqsEndpoint = bool
  })
}

variable "aws_region_name" {
  description = "AWS region name"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account id name"
  type        = string
}

variable "aws_sns_role_id" {
  description = "AWS SNS role arn"
  type        = string
}

variable "aws_sns_topic_id" {
  description = "AWS SNS topic arn"
  type        = string
}

variable "es_domain_name" {
  description = "Domain name"
  type        = string
}
