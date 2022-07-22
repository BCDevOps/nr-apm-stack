terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}

# Create main IAM snapshot role
resource "aws_iam_role" "opensearch_snapshot_role" {
  name = "opensearch_snapshot_role_${var.es_domain_name}"
  assume_role_policy = data.aws_iam_policy_document.opensearch_snapshot_assume_role_policy.json
}

data "aws_iam_policy_document" "opensearch_snapshot_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Create OpenSearch snapshot role
resource "elasticsearch_opensearch_role" "opensearch_snapshot_creator" {
  role_name   = "opensearch_snapshot_creator_${var.es_domain_name}"
  description = "Snapshot creator role"

  cluster_permissions = ["cluster:admin/snapshot/create"]
}

# Map OpenSearch snapshot role to IAM snapshot role
resource "elasticsearch_opensearch_roles_mapping" "opensearch_snapshot_mapper" {
  role_name     = elasticsearch_opensearch_role.opensearch_snapshot_creator.id
  description   = "Map AWS IAM roles to OpenSearch role"
  backend_roles = [
    aws_iam_role.opensearch_snapshot_role.arn
  ]
}

resource "aws_lambda_function" "opensearch_snapshot_lambda_function" {
  # If the file is not in the current working directory you will need to include a 
  # path.module in the filename.
  filename      = "${path.module}/handler/opensearch-snapshot.zip"
  function_name = "opensearch_snapshot_lambda_function_${var.es_domain_name}"
  role          = aws_iam_role.opensearch_snapshot_role.arn
  handler       = "index.handler"

  runtime = "nodejs16.x"

  layers = [aws_lambda_layer_version.workflow_cli.arn]
}

resource "aws_iam_role_policy_attachment" "opensearch_snapshot_basic_execution" {
  role       = aws_iam_role.opensearch_snapshot_role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_layer_version" "workflow_cli" {
  filename   = "workflow-cli.zip"
  layer_name = "workflow_cli_${var.es_domain_name}"

  compatible_runtimes = ["nodejs16.x"]
}

data "archive_file" "opensearch_snapshot_handler" {
  type = "zip"

  source_dir  = "${path.module}/handler/"
  output_path = "${path.module}/handler/opensearch-snapshot.zip"
}

# Schedule snapshot creation
resource "aws_cloudwatch_event_rule" "opensearch_snapshot_daily" {
  name                = "opensearch_snapshot_daily"
  description         = "Daily OpenSearch Snapshot"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "opensearch_snapshot_daily" {
  rule      = "${aws_cloudwatch_event_rule.opensearch_snapshot_daily.name}"
  target_id = "opensearch_snapshot_daily"
  arn       = "${aws_lambda_function.opensearch_snapshot_lambda_function.arn}"
}

resource "aws_lambda_permission" "opensearch_snapshot_allow_cloudwatch_execution" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.opensearch_snapshot_lambda_function.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.opensearch_snapshot_daily.arn}"
}
