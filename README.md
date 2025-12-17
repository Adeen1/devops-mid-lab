# Lab Final Exam - DevOps Project

## Overview
This project demonstrates a full DevOps lifecycle for a web application (Frontend + Backend + DB). It includes containerization, Infrastructure as Code (Terraform), Kubernetes deployment, and a CI/CD pipeline.

## How to Run

### Locally (Docker Compose)
To run the application locally for testing:
1. Ensure Docker is running.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Access Frontend at `http://localhost:5173` (or configured port).
4. Access Backend at `http://localhost:5000`.

### Kubernetes Deployment
The application is designed to be deployed on AWS EKS via the CI/CD pipeline, but can be deployed manually:
1. Configure `kubectl` to point to your cluster.
2. Apply manifests:
   ```bash
   kubectl apply -f k8s/redis.yaml
   kubectl apply -f k8s/secrets.yaml # Ensure valid secrets
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/frontend.yaml
   ```

## Infrastructure Setup & Teardown

### Setup
The infrastructure is provisioned using Terraform:
1. Navigate to `infra/`:
   ```bash
   cd infra
   ```
2. Initialize and Apply:
   ```bash
   terraform init
   terraform apply
   ```
   This will create the VPC, EKS Cluster, RDS Database, and ECR Repositories.

### Teardown (Important!)
To avoid AWS costs, destroy resources after use:
```bash
terraform destroy
```

## Architecture
- **Frontend**: React/Vite (Containerized)
- **Backend**: Node.js/Express (Containerized)
- **Database**: AWS RDS (PostgreSQL)
- **Cache**: Redis (running in K8s)
- **Infrastructure**: AWS VPC, EKS, RDS, ECR
