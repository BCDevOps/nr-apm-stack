resource "aws_iam_role" "opensearch_snapshot" {
  name = "opensearch_snapshot"
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

resource "aws_iam_role_policy" "opensearch_snapshot" {
  name = "opensearch_snapshot"
  role = aws_iam_role.opensearch_snapshot.id
  policy = data.aws_iam_policy_document.opensearch_snapshot.json
}

# AWS Policy Generator:
# https://awspolicygen.s3.amazonaws.com/policygen.html
data "aws_iam_policy_document" "opensearch_snapshot" {
  statement {
    sid = "CreateCloudWatchLogEvents"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }
  statement {
    sid = "CreateOpenSearchSnapshot"
    actions = [
      "es:ESHttpPut"
    ]
    resources = [
      "*",
    ]
  }
}

resource "aws_lambda_function" "opensearch_snapshot" {
  # If the file is not in the current working directory you will need to include a 
  # path.module in the filename.
  filename      = "${path.module}/handler/opensearch-snapshot.zip"
  function_name = "opensearch-snapshot"
  role          = aws_iam_role.opensearch_snapshot.arn
  handler       = "index.handler"

  runtime = "nodejs16.x"

  layers = [aws_lambda_layer_version.workflow_cli.arn]
}

resource "aws_lambda_layer_version" "workflow_cli" {
  filename   = "workflow-cli.zip"
  layer_name = "workflow-cli"

  compatible_runtimes = ["nodejs16.x"]
}

data "archive_file" "opensearch_snapshot_handler" {
  type = "zip"

  source_dir  = "${path.module}/handler/"
  output_path = "${path.module}/handler/opensearch-snapshot.zip"
}
