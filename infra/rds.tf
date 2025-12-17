module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "lab-exam-db"

  engine            = "postgres"
  engine_version    = "14"
  instance_class    = "db.t3.micro" # Free tier eligible often
  allocated_storage = 5

  db_name  = "labdb"
  username = "dbadmin"
  port     = "5432"

  iam_database_authentication_enabled = true

  vpc_security_group_ids = [aws_security_group.rds.id]
  maintenance_window     = "Mon:00:00-Mon:03:00"
  backup_window          = "03:00-06:00"
  
  # DB subnet group
  create_db_subnet_group = true
  subnet_ids             = local.subnet_ids

  # Family
  family = "postgres14"
  major_engine_version = "14"
  
  skip_final_snapshot = true # For lab/demo to avoid hang on delete
}

resource "aws_security_group" "rds" {
  name        = "lab-exam-rds-sg"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = local.vpc_id

  ingress {
    description = "PostgreSQL from VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Adjust if using different VPC CIDR
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lab-exam-rds-sg"
  }
}
