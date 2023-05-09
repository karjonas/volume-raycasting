/*
 * Copyright © 2018 Martino Pilia <martino.pilia@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#version 140

out vec4 a_colour;

uniform mat4 ViewMatrix;
uniform mat4 ModelMatrix;
uniform mat4 ModelMatrixInverse;
uniform mat3 NormalMatrix;

uniform float focal_length;
uniform float aspect_ratio;
uniform vec2 viewport_size;
uniform vec3 ray_origin;
//uniform vec3 top;
//uniform vec3 bottom;

uniform vec3 background_colour;
uniform vec3 material_colour;
uniform vec3 light_position;

uniform float step_length;
uniform float threshold;

uniform sampler3D volume;
uniform sampler2D jitter;

uniform float gamma;

// Ray
struct Ray {
    vec3 origin;
    vec3 direction;
};

// Axis-aligned bounding box
struct AABB {
    vec3 top;
    vec3 bottom;
};

// Slab method for ray-box intersection
void ray_box_intersection(Ray ray, AABB box, out float t_0, out float t_1)
{
    vec3 direction_inv = 1.0 / ray.direction;
    vec3 t_top = direction_inv * (box.top - ray.origin);
    vec3 t_bottom = direction_inv * (box.bottom - ray.origin);
    vec3 t_min = min(t_top, t_bottom);
    vec2 t = max(t_min.xx, t_min.yz);
    t_0 = max(0.0, max(t.x, t.y));
    vec3 t_max = max(t_top, t_bottom);
    t = min(t_max.xx, t_max.yz);
    t_1 = min(t.x, t.y);
}

// A very simple colour transfer function
vec4 colour_transfer(float intensity)
{
    vec3 high = vec3(1.0, 1.0, 1.0);
    vec3 low = vec3(0.0, 0.0, 0.0);
    float alpha = (exp(intensity) - 1.0) / (exp(1.0) - 1.0);
    return vec4(intensity * high + (1.0 - intensity) * low, alpha);
}

void main()
{
    vec3 ray_direction;
    ray_direction.xy = 2.0 * gl_FragCoord.xy / viewport_size - 1.0;
    float aspect_ratio = viewport_size.x / viewport_size.y;
    ray_direction.x *= aspect_ratio;
    ray_direction.z = -focal_length;
    mat4 ViewMatrixTranspose = transpose(ViewMatrix);
    ray_direction = (ViewMatrixTranspose * vec4(ray_direction, 0)).xyz;

    mat4 ViewMatrixInverse = inverse(ViewMatrix);
    vec3 ray_origin = (ViewMatrixInverse * vec4(0,0,0,1)).xyz;

    mat4 ModelMatrixInverse = inverse(ModelMatrix);
    
    vec4 ray_direction_world = ModelMatrixInverse * vec4(ray_direction, 1);
    vec4 ray_origin_world = ModelMatrixInverse * vec4(ray_origin, 1);
    
    ray_direction = ray_direction_world.xyz;
    ray_origin = ray_origin_world.xyz;

    float t_0, t_1;
    Ray casting_ray = Ray(ray_origin, ray_direction);

    vec3 top = vec3(1,1,1);
    vec3 bottom = vec3(-1,-1,-1);

    AABB bounding_box = AABB(top, bottom);
    ray_box_intersection(casting_ray, bounding_box, t_0, t_1);

    vec3 ray_start = (ray_origin + ray_direction * t_0 - bottom) / (top - bottom);
    vec3 ray_stop = (ray_origin + ray_direction * t_1 - bottom) / (top - bottom);

    vec3 ray = ray_stop - ray_start;
    float ray_length = length(ray);
    float step_length = 2.0/256.0;
    vec3 step_vector = step_length * ray / ray_length;

    vec3 position = ray_start;
    vec4 colour = vec4(0.0);

    // Ray march until reaching the end of the volume, or colour saturation
    int limit = 0;
    while (ray_length > 0 && colour.a < 1.0 && limit < 1000) {
        limit += 1;

        float intensity = texture(volume, position).r;

        vec4 c = colour_transfer(intensity);

        // Alpha-blending
        colour.rgb = c.a * c.rgb + (1 - c.a) * colour.a * colour.rgb;
        colour.a = c.a + (1 - c.a) * colour.a;

        ray_length -= step_length;
        position += step_vector;
    }

    a_colour = colour;
}
