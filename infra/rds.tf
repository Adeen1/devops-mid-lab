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

  vpc_security_group_ids = [module.vpc.default_security_group_id] # Should ideally create a specific SG
  maintenance_window     = "Mon:00:00-Mon:03:00"
  backup_window          = "03:00-06:00"
  
  # DB subnet group
  create_db_subnet_group = true
  subnet_ids             = module.vpc.private_subnets

  # Family
  family = "postgres14"
  major_engine_version = "14"
  
  skip_final_snapshot = true # For lab/demo to avoid hang on delete
}
