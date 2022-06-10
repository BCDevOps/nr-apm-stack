variable "topic" {
  description = "Topic details"
  type        = object({
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
variable "aws_sns_role_id" {
  description = "AWS SNS role arn"
  type        = string
}

>>>>>>> feat: add topic sqs and Opensearch destinations
=======
>>>>>>> fix: remove unnecessary
variable "es_domain_name" {
  description = "Domain name"
  type        = string
}
