variable "create_vpc" {
  description = "Controls if VPC should be created (true) or reused (false)"
  type        = bool
  default     = true
}

variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "lab-exam-vpc"
}
