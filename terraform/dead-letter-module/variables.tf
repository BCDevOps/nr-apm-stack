
variable "aws_region_name" {
  description = "AWS region name"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account id name"
  type        = string
}

variable "es_domain_name" {
  description = "Domain name"
  type        = string
}

variable "lambda_iit_agents_arn" {
  description = "Agents that can push to dl"
  type        = string
}

variable "dlq_stream_name" {
  description = "Name of the DLQ"
  type        = string
}

