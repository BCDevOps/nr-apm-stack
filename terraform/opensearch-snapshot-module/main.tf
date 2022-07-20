resource "aws_iam_role" "create_opensearch_snapshot" {
  name = "create_opensearch_snapshot"
  assume_role_policy = aws_iam_role_policy.create_opensearch_snapshot
}

resource "aws_iam_role_policy" "create_opensearch_snapshot" {
  name = "create_opensearch_snapshot"
  role = aws_iam_role.create_opensearch_snapshot.id
  policy = aws_iam_policy_document.create_opensearch_snapshot.json
}

# AWS Policy Generator:
# https://awspolicygen.s3.amazonaws.com/policygen.html
data "aws_iam_policy_document" "create_opensearch_snapshot" {
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

resource "aws_lambda_function" "create_opensearch_snapshot" {
  # If the file is not in the current working directory you will need to include a 
  # path.module in the filename.
  filename      = "create_opensearch_snapshot.zip"
  function_name = "create_opensearch_snapshot"
  role          = aws_iam_role.create_opensearch_snapshot.arn
  handler       = "index.js"

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  source_code_hash = filebase64sha256("create_opensearch_snapshot.zip")

  runtime = "nodejs16.x"

  layers = [aws_lambda_layer_version.workflow_cli.arn]
}

resource "aws_lambda_layer_version" "workflow_cli" {
  filename   = "workflow-cli.zip"
  layer_name = "workflow_cli"

  compatible_runtimes = ["nodejs16.x"]
}
