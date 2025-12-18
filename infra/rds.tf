module "db" {
  source = "terraform-aws-modules/rds/aws"
  manage_master_user_password = false
  publicly_accessible         = true
  
  identifier = "devops-mid-lab-db"

  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro" # Free tier eligible often
  allocated_storage = 20

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = "5432"

  iam_database_authentication_enabled = true

  vpc_security_group_ids = [module.security_group.security_group_id]

  # Database Deletion Protection
  deletion_protection = false # Set to true for prod
  skip_final_snapshot = true 

  tags = {
    Owner       = "user"
    Environment = "dev"
  }

  # DB subnet group
  create_db_subnet_group = true
  subnet_ids             = module.vpc.public_subnets

  # DB parameter group
  family = "postgres15"

  # DB option group
  major_engine_version = "15"
}

module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "devops-mid-lab-db-sg"
  description = "Complete PostgreSQL example security group"
  vpc_id      = module.vpc.vpc_id

  # Ingress to allow access from VPC CIDR (simplification for lab)
  ingress_with_cidr_blocks = [
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      description = "PostgreSQL access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
  ]
}
