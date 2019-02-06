# Step 1: Build frontend
FROM node:8-alpine as frontend-builder
COPY frontend /app
WORKDIR /app
RUN yarn && yarn build
CMD ['echo', 'OK']

# Step 2: Copy code from backend and frontend and RUN!
FROM python:3.7-stretch
COPY --from=frontend-builder /app/dist /app/static
COPY backend /app

WORKDIR /app

RUN pip install -r requirements.txt --no-cache-dir

EXPOSE 5000

CMD ["python3", "run.py"]
