output "topic_id" {
  value = aws_sns_topic.topic.id
}

output "destination_id" {
  value = elasticsearch_opensearch_destination.destination.id
}
