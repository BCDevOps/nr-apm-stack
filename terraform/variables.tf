variable "region" {
  type = string
  description = "AWS Region, where to deploy ELK cluster."
  default = "ca-central-1"
}

variable "env" {
  type = string
  description = "Environment this is a deployment for"
  default = null
}

variable "suffix" {
  type = string
  description = "Suffix appended to all managed resource names"
  default = "-dev-0"
}

variable "custom_endpoint" {
  type = string
  description = "Custom Endpoint"
  default = null
}

variable "custom_endpoint_certificate_arn" {
  type = string
  description = "Custom Endpoint Certificate ARN"
  default = null
}

variable "iit_lambda_code_bucket_key_version" {
  type = string
  description = "Lambda Code Package Version"
  default = null
}

variable "target_aws_account_id" {
  type = string
  description = "target_aws_account_id"
  default = null
}

variable "target_env" {
  type = string
  description = "target_env"
  default = null
}

variable "master_node_instance_count" {
  type = number
  default = 0
}

variable "master_node_instance_type" {
  type = string
  default = "c6g.large.search"
}

variable "data_node_instance_count" {
  type = number
  default = 2
}

variable "data_node_instance_type" {
  type = string
  default = "r6g.large.search"
}

variable "data_node_volume_size" {
  type = number
  default = 350
}

variable "kinesis_shards" {
  type = number
  default = 2
}

variable "ultrawarm_node_instance_count" {
  type = number
  default = null
}

variable "ultrawarm_node_instance_type" {
  type = string
  default = "ultrawarm1.medium.search"
}
