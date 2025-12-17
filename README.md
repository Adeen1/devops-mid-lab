# DevOps Mid Lab Project

## Overview
This project is a containerized web application with a corresponding DevOps pipeline. It includes:
- **Frontend**: React/Vite
- **Backend**: Node.js/Express
- **Databases**: MongoDB, PostgreSQL, Redis

## Prerequisites
- **Docker & Docker Compose**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Terraform**: [Download Terraform](https://developer.hashicorp.com/terraform/downloads) (Add to system PATH)
- **AWS CLI**: [Download AWS CLI](https://aws.amazon.com/cli/)
- **Ansible**: [Installation Guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) (Easier on Linux/WSL)
- **Kubectl**: [Download Kubectl](https://kubernetes.io/docs/tasks/tools/)

## 1. Run Locally (Docker Compose)
To spin up the entire stack locally:
```bash
# Create .env if not exists
cp .env.example .env

# Run
docker-compose up --build
```
Access the app at `http://localhost:5000`.

## 2. Infrastructure (Terraform)
Provision AWS resources (EKS, VPC, RDS):
```bash
cd infra
terraform init
terraform apply
```
*Note: This will incur AWS costs.*

## 3. Configuration (Ansible)
Setup local environment or servers:
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

## 4. Deployment (Kubernetes)
Deploy to EKS (or Minikube):
```bash
# Apply Manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml

# Monitoring
kubectl apply -f k8s/monitoring/
```

## 5. CI/CD
The project uses GitHub Actions defined in `.github/workflows/main.yml`. It automatically builds, tests, and deploys on push to `main`.
