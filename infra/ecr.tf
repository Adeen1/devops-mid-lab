resource "aws_ecr_repository" "backend" {
  name                 = "lab-exam-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true # For lab cleanup
}

resource "aws_ecr_repository" "frontend" {
  name                 = "lab-exam-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}
