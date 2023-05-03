#!/usr/bin/python

## vtk DataFile Version 2.0
#My great file
#BINARY
#DATASET STRUCTURED_POINTS
#DIMENSIONS 222 346 1434 # Put here the dimensions x, y, z
#ASPECT_RATIO 0.1 0.1 0.1 # The spacing or voxel size
#ORIGIN 0 0 0
#POINT_DATA 110148408 # x*y*z
#SCALARS volume_scalars short 1 # short=16 Bit, char=8 Bit
#LOOKUP_TABLE default

#    // # vtk DataFile Version x.x\n
#    // comment\n
#    // BINARY\n
#    // DATASET STRUCTURED_POINTS\n
#    // DIMENSIONS 128 128 128\n
#    // ORIGIN 0.0 0.0 0.0\n
#    // SPACING 1.0 1.0 1.0\n
#    // POINT_DATA 2097152\n
#    // SCALARS image_data unsigned_char\n
#    // LOOKUP_TABLE default\n


import argparse
import sys
from pathlib import Path

def main():
    print("Hello World!")
    argParser = argparse.ArgumentParser()
    argParser.add_argument("-i", "--input",  required=True, help="input")
    argParser.add_argument("-o", "--output", required=True, help="output")
    argParser.add_argument("-x", type=int,   required=True, help="dimensions x")
    argParser.add_argument("-y", type=int,   required=True, help="dimensions y")
    argParser.add_argument("-z", type=int,   required=True, help="dimensions z")
    args = argParser.parse_args()
    print("args=%s" % args)
    print("args.name=%s" % args.input)
    try:
        f = open(args.input, 'rb')
    except OSError:
        print("Could not open/read file:" + args.input)
        sys.exit()

    volbytes = f.read()
    nums = list(volbytes)

    try:
        f = open(args.output, 'wb')
    except OSError:
        print("Could not open/read file:" + args.output)
        sys.exit()

    f.write(bytes("# vtk DataFile Version 2.0\n", 'ascii'))
    f.write(bytes("My silly file\n", 'ascii'))
    f.write(bytes("BINARY\n", 'ascii'))
    f.write(bytes("DATASET STRUCTURED_POINTS\n", 'ascii'))
    #f.write(bytes("DATASET UNSTRUCTURED_GRID\n", 'ascii'))
    f.write(bytes("DIMENSIONS " + str(args.x) + " " + str(args.y) + " " + str(args.z) + "\n", 'ascii')) # Put here the dimensions x, y, z
    #f.write(bytes("ASPECT_RATIO 0.1 0.1 0.1\n", 'ascii')) # The spacing or voxel size
    f.write(bytes("ORIGIN 0.0 0.0 0.0\n", 'ascii'))
    f.write(bytes("SPACING 1.0 1.0 1.0\n", 'ascii'))
    f.write(bytes("POINT_DATA " + str(args.x*args.y*args.z) + "\n", 'ascii')) # x*y*z
   # f.write(bytes("SCALARS image_data unsigned_char\n", 'ascii'))
    f.write(bytes("SCALARS volume_scalars unsigned_char\n", 'ascii'))
    f.write(bytes("LOOKUP_TABLE default\n", 'ascii'))
    #for i in range(int((args.x*args.y*args.z)/3)):
    #    x = str(nums[i*3 + 0])
    #    y = str(nums[i*3 + 1])
    #    z = str(nums[i*3 + 2])
    #    f.write(bytes(x + ", " + y + ", " + z + "\n", 'ascii'))
    f.write(volbytes)
    
    #for i in range(len(nums)-1):
    #    f.write(bytes(str(nums[i]) + ", ", "ascii"))
    #f.write(bytes(str(nums[len(nums)-1]), "ascii"))


if __name__ == "__main__":
    main()
