#!/bin/bash

# Number of times to run git build
num_builds=20

# Array to store build times
build_times=()

# Function to calculate average
calculate_average() {
  total=0
  for time in "${build_times[@]}"; do
    total=$((total + time))
  done

  average=$((total / num_builds))
  echo "Average build time: $average seconds"
}


# Run git build multiple times
for ((i = 1; i <= num_builds; i++)); do
  start_time=$(date +%s)
  npm run build
  end_time=$(date +%s)

  build_time=$((end_time - start_time))
  build_times+=("$build_time")

  echo "build $i took: $build_time seconds"
done

# Display average build time
calculate_average