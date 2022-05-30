variable "topic" {
  description = "Topic details"
  type        = object({
    name = string
    display = string
    resourceId = string
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
