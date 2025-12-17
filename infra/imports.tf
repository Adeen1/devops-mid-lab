import {
  to = aws_ecr_repository.backend
  id = "lab-exam-backend"
}

import {
  to = aws_ecr_repository.frontend
  id = "lab-exam-frontend"
}

import {
  to = module.eks.aws_cloudwatch_log_group.this[0]
  id = "/aws/eks/adeen-devops/cluster"
}

import {
  to = module.eks.module.kms.aws_kms_alias.this["cluster"]
  id = "alias/eks/adeen-devops"
}

import {
  to = module.eks.aws_eks_cluster.this[0]
  id = "adeen-devops"
}
