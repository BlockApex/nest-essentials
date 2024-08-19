import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) {
        this.logger.verbose('UsersService Initialized.');
    }

    findOneById = async (id: string): Promise<UserDocument | undefined> => {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User does not exist.')
        }
        return user
    }

    findOneByEmail = async (email: string): Promise<UserDocument | undefined> => {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User does not exist.')
        }
        return user;
    }

    createOne = async (userProps: User): Promise<UserDocument> => {
        return await this.userModel.create(userProps);
    }

    updateByEmail = async (email: string, userProps: User): Promise<UserDocument | undefined> => {
        const user = await this.userModel.findOneAndUpdate({ email }, userProps)
        if (!user) {
            throw new NotFoundException('User does not exist.')
        }
        return user;
    }
}
